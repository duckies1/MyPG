import { PgApi, TenantApi, BedApi } from './api';

// Prefetch commonly used data - all with silent mode to not show loading
export const prefetchData = {
  // Prefetch user's PGs
  pgs: async () => {
    try {
      await PgApi.list({ silent: true });
    } catch (err) {
      console.debug('Prefetch PGs failed (this is ok)', err);
    }
  },

  // Prefetch tenants (first page)
  tenants: async () => {
    try {
      await TenantApi.list(1, 50, { silent: true });
    } catch (err) {
      console.debug('Prefetch Tenants failed (this is ok)', err);
    }
  },

  // Prefetch unassigned tenants for assignment
  unassignedTenants: async () => {
    try {
      await TenantApi.unassigned({ silent: true });
    } catch (err) {
      console.debug('Prefetch Unassigned Tenants failed (this is ok)', err);
    }
  },

  // Prefetch available beds
  availableBeds: async () => {
    try {
      await BedApi.available({ silent: true });
    } catch (err) {
      console.debug('Prefetch Available Beds failed (this is ok)', err);
    }
  },

  // Prefetch all likely data for authenticated user
  allForAuth: async () => {
    await Promise.allSettled([
      prefetchData.pgs(),
      prefetchData.tenants(),
      prefetchData.unassignedTenants(),
      prefetchData.availableBeds(),
    ]);
  },
};
