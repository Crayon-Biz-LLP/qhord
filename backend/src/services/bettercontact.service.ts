import { BetterContactsService } from './bettercontacts.service';

export class BetterContactService extends BetterContactsService {
  constructor(apiKey: string) {
    super(apiKey);
  }
}
export { BetterContactsService };
