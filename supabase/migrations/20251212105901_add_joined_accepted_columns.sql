-- Add joined_at to employees
ALTER TABLE employees
ADD COLUMN joined_at TIMESTAMP DEFAULT now();

-- Add accepted_at to invitations
ALTER TABLE invitations
ADD COLUMN accepted_at TIMESTAMP;
