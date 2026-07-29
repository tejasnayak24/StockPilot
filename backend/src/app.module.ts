import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { SuppliersModule } from './suppliers/suppliers.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CategoriesModule, SuppliersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
