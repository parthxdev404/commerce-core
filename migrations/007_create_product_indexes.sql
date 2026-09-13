CREATE INDEX idx_products_vendor_id
ON products(vendor_id);

CREATE INDEX idx_products_category_id
ON products(category_id);

CREATE INDEX idx_products_active
ON products(is_active);

CREATE INDEX idx_products_category_active
ON products(category_id, is_active);