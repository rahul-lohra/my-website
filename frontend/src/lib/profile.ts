import data from '../../../content/profile.json';
import {profileSchema} from '../../../shared/schema';
export const profile=profileSchema.parse(data);
