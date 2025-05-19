import config from './config';

import cors from 'cors';
import express from 'express';
import errorHandleMiddleware from './common/middlewares/error-handle';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

import prisma from './lib/prisma';

// Weather Module
import { FetchHttpClient } from './common/http-client';
import { WeatherController } from './modules/weather/weather.controller';
import weatherRouterFactory from './modules/weather/weather.router';
import { WeatherService } from './modules/weather/weather.service';
const httpClient = new FetchHttpClient();
const weatherService = new WeatherService(httpClient, config.weather);
const weatherController = new WeatherController(weatherService);
app.use('/api', weatherRouterFactory(weatherController));

// Subscription Module
import { GmailEmailingService } from '@/common/services/gmail-emailing';
import { SubscriptionController } from './modules/subscription/subscription.controller';
import subscriptionRouterFactory from './modules/subscription/subscription.router';
import { SubscriptionService } from './modules/subscription/subscription.service';
const emailingService = new GmailEmailingService({
  user: config.smtp.user,
  password: config.smtp.password,
  from: config.smtp.from,
});
const subscriptionService = new SubscriptionService(prisma, emailingService);
const subscriptionController = new SubscriptionController(subscriptionService);
app.use('/api', subscriptionRouterFactory(subscriptionController));

// Error handling middleware
app.use(errorHandleMiddleware);

export default app;
