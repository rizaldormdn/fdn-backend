-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id INTEGER UNIQUE NOT NULL,
    rate DECIMAL(3, 2) NOT NULL CHECK (rate >= 0 AND rate <= 5),
    count INTEGER NOT NULL CHECK (count >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Create indexes for better performance
CREATE INDEX idx_ratings_product_id ON ratings(product_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ratings_deleted_at ON ratings(deleted_at);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for ratings table
CREATE TRIGGER update_ratings_updated_at 
    BEFORE UPDATE ON ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample comment
COMMENT ON TABLE ratings IS 'Table for storing product ratings';
COMMENT ON COLUMN ratings.rate IS 'Rating value between 0 and 5';
COMMENT ON COLUMN ratings.count IS 'Number of ratings received';