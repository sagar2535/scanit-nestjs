import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbUrlString = configService.get<string>('DATABASE_URL');

        if (!dbUrlString) {
          throw new Error('DATABASE_URL is not defined');
        }

        const dbUrl = new URL(dbUrlString);

        return {
          dialect: 'postgres',
          host: dbUrl.hostname,
          port: parseInt(dbUrl.port),
          username: dbUrl.username,
          password: dbUrl.password,
          database: dbUrl.pathname.replace('/', ''),
          autoLoadModels: true,
          synchronize: true,
          logging: (msg) => console.log(msg),
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          },
        };
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    try {
      await this.sequelize.authenticate();
      Logger.log(
        `✅ Connected to DB: ${this.sequelize.getDatabaseName()}`,
        'Sequelize',
      );
    } catch (error) {
      Logger.error('❌ Unable to connect to the database', error, 'Sequelize');
    }
  }
}
