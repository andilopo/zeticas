-- SQL to create site_content table for landing page CMS
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    content TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(section, key)
);

-- Basic indexes
CREATE INDEX idx_site_content_section ON site_content(section);

-- Default data for Hero
INSERT INTO site_content (section, key, content) VALUES 
('hero', 'top_text', 'Sabana de Bogotá • Colombia'),
('hero', 'title', 'Zeticas'),
('hero', 'description', 'Conservas premium y consultoría con propósito. Redescubriendo el valor de nuestra tierra y sus productores.'),
('hero', 'cta_text', 'Explorar Colección')
ON CONFLICT (section, key) DO NOTHING;

-- Default data for Philosophy
INSERT INTO site_content (section, key, content) VALUES
('philosophy', 'title', 'Filosofía & Enfoque'),
('philosophy', 'subtitle', '{ SER para HACER }')
ON CONFLICT (section, key) DO NOTHING;

-- Default data for Support
INSERT INTO site_content (section, key, content) VALUES
('support', 'title', 'Apoyo & soporte'),
('support', 'subtitle', 'Sinergias de vida'),
('support', 'description', 'Sistema megadiverso que aumentan la eficiencia en el ecosistema')
ON CONFLICT (section, key) DO NOTHING;
