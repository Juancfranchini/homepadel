import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { OrdersModule } from './orders/orders.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CouponsModule } from './coupons/coupons.module';
import { BannersModule } from './banners/banners.module';
import { UploadsModule } from './uploads/uploads.module';
import { ExpensesModule } from './expenses/expenses.module';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { BenefitsModule } from './benefits/benefits.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { FaqModule } from './faq/faq.module';
import { SiteSectionsModule } from './site-sections/site-sections.module';
import { InstagramModule } from './instagram/instagram.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    OrdersModule,
    PromotionsModule,
    CouponsModule,
    BannersModule,
    UploadsModule,
    ExpensesModule,
    HeroSlidesModule,
    BenefitsModule,
    TestimonialsModule,
    FaqModule,
    SiteSectionsModule,
    InstagramModule,
  ],
})
export class AppModule {}
