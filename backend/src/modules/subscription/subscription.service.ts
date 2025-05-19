import { IEmailingService } from '@/common/interfaces/emailing-service';
import { PrismaClient } from '@/lib/prisma';
import crypto from 'crypto';
import { EmailAlreadySubscribed, TokenNotFound } from './errors/subscription-service';

const TOKEN_LENGTH = 32;

function generateToken(length: number): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

export class SubscriptionService {
  constructor(
    private prisma: PrismaClient,
    private emailingService: IEmailingService,
  ) {}

  async subscribe(email: string, city: string, frequency: 'daily' | 'hourly'): Promise<void> {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { email },
    });

    if (existingSubscription) {
      throw new EmailAlreadySubscribed();
    }

    const confirmationToken = generateToken(TOKEN_LENGTH);
    const revokeToken = generateToken(TOKEN_LENGTH);

    await this.prisma.subscription.create({
      data: {
        email,
        city,
        frequency,
        confirmationToken,
        revokeToken,
        isConfirmed: false,
      },
    });

    this.emailingService.sendEmail({
      to: email,
      subject: 'Weather Subscription Confirmation',
      html: `
        <p>
          You requested a subscription to weather updates.
          Please confirm your subscription by clicking the link: 
          <a href="${process.env.APP_URL}/api/confirm/${confirmationToken}">Confirm Subscription</a>
        </p>
        
        <br>
        <p>City: ${city}</p>
        <p>Frequency: ${frequency}</p>
        <br>
      `,
    });
  }

  async confirmSubscription(token: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { confirmationToken: token },
    });

    if (!subscription) {
      throw new TokenNotFound();
    }

    await this.prisma.subscription.update({
      where: { confirmationToken: token },
      data: { isConfirmed: true, confirmationToken: null },
    });

    this.emailingService.sendEmail({
      to: subscription.email,
      subject: 'Weather Subscription Successfully Confirmed!',
      html: `
        <p>Your subscription successfully confirmed!</p>
        <br>
        <p>City: ${subscription.city}</p>
        <p>Frequency: ${subscription.frequency}</p>
        <br>
        <p>You always can <a href="${process.env.APP_URL}/api/unsubscribe/${subscription.revokeToken}">Unsubscribe</a></p>
      `,
    });
  }

  async unsubscribe(token: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { revokeToken: token },
    });

    if (!subscription) {
      throw new TokenNotFound();
    }

    await this.prisma.subscription.delete({
      where: { revokeToken: token },
    });

    this.emailingService.sendEmail({
      to: subscription.email,
      subject: 'Weather Subscription Successfully Unsubscribed!',
      html: `
        <p>Your subscription successfully unsubscribed!</p>
        <br>
        <p>City: ${subscription.city}</p>
        <p>Frequency: ${subscription.frequency}</p>
        <br>
      `,
    });
  }
}
