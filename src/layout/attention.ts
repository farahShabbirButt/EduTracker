import { routes } from '../config/routes';
import type { AttentionItem } from '../redux/slices/dashboardSlice';

// Where a "Needs attention" item takes you
export const attentionPath = (item: AttentionItem) => {
  if (item.link === 'marks') {
    return `${routes.portal.marks}?class=${item.classExternalId}&test=${item.testExternalId}`;
  }
  if (item.link === 'conduct') {
    return `${routes.portal.conduct}?class=${item.classExternalId}`;
  }
  if (item.link === 'grades') return `${routes.portal.subjects}?tab=grades`;
  return routes.portal.subjects;
};
