import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../core/supabase.client';

export const adminAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const { data, error } = await supabase.auth.getSession();

  if (!error && data.session) {
    return true;
  }

  return router.createUrlTree(['/admin/login']);
};
