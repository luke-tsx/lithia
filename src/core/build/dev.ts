import { Lithia } from 'lithia/types';
import { scanHandlers } from '../scan';

export async function watchDev(lithia: Lithia) {
  async function load() {
    await scanHandlers(lithia);
  }
}