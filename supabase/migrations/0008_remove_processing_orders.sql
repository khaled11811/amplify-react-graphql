-- 1. Delete orders that never completed payment (pending = abandoned checkout)
DELETE FROM orders WHERE status = 'pending';

-- 2. Delete orders manually set to 'processing' (status is being removed)
DELETE FROM orders WHERE status = 'processing';

-- 3. Drop the default on status so the enum swap doesn't fail
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

-- 4. Recreate the order_status enum without 'pending' and 'processing'.
--    Workflow now starts at 'paid' (order only created after Stripe confirms payment).
ALTER TYPE order_status RENAME TO order_status_old;
CREATE TYPE order_status AS ENUM ('paid', 'shipped', 'completed', 'cancelled');
ALTER TABLE orders ALTER COLUMN status TYPE order_status USING status::text::order_status;
DROP TYPE order_status_old;

-- 5. Set the new default to 'paid'
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'paid';
