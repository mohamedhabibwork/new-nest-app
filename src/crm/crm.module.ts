import { Module } from '@nestjs/common';
import { ContactsModule } from './contacts/contacts.module';
import { CompaniesModule } from './companies/companies.module';
import { ActivitiesModule } from './activities/activities.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { DealsModule } from './deals/deals.module';
import { ProductsModule } from './products/products.module';
import { TicketsModule } from './tickets/tickets.module';
import { FormsModule } from './forms/forms.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { SegmentsModule } from './segments/segments.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({
  imports: [
    ContactsModule,
    CompaniesModule,
    ActivitiesModule,
    PipelinesModule,
    DealsModule,
    ProductsModule,
    TicketsModule,
    FormsModule,
    SubmissionsModule,
    SegmentsModule,
    CampaignsModule,
    WorkflowsModule,
  ],
  exports: [
    ContactsModule,
    CompaniesModule,
    ActivitiesModule,
    PipelinesModule,
    DealsModule,
    ProductsModule,
    TicketsModule,
    FormsModule,
    SubmissionsModule,
    SegmentsModule,
    CampaignsModule,
    WorkflowsModule,
  ],
})
export class CrmModule {}

