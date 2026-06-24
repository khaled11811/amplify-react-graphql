ALTER TABLE stores
  ADD COLUMN stripe_account_id text,
  ADD COLUMN stripe_charges_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN stripe_onboarding_status text NOT NULL DEFAULT 'not_started'
    CHECK (stripe_onboarding_status IN ('not_started', 'pending', 'complete'));

CREATE UNIQUE INDEX idx_stores_stripe_account_id ON stores (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;
