import { Module } from '@nestjs/common';
import { AuthModule } from '@ebla-claim/auth';
import { ClaimModule } from '@ebla-claim/claim';
import { GeneralModule } from './general.module';

@Module({
  imports: [GeneralModule, AuthModule, ClaimModule.forRoot()],
})
export class AppModule {}
