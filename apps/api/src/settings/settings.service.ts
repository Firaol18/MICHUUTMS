import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencySettings } from './entities/agency-settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AgencySettings)
    private readonly repo: Repository<AgencySettings>,
  ) {}

  async getSettings(): Promise<AgencySettings> {
    const settings = await this.repo.findOne({ where: {} });
    if (settings) return settings;

    // Seed default settings row if empty
    const def = this.repo.create({
      agencyName: 'MICHUU Tourism & Travel Management',
      contactEmail: 'concierge@michuutours.et',
      currency: 'ETB (Br) / USD ($)',
      depositPercent: 25,
    });
    return this.repo.save(def);
  }

  async updateSettings(data: Partial<AgencySettings>): Promise<AgencySettings> {
    const current = await this.getSettings();
    Object.assign(current, data);
    return this.repo.save(current);
  }
}
