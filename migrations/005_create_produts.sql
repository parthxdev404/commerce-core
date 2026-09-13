CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,

    vendor_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    name VARCHAR(200) NOT NULL,

    description TEXT,

    sku VARCHAR(100) NOT NULL UNIQUE,

    price NUMERIC(12, 2) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_products_vendor
        FOREIGN KEY (vendor_id)
        REFERENCES vendors(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_products_price
        CHECK (price >= 0)
);