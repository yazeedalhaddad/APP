-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role, department) VALUES
('admin@titanium.com', '$2b$10$example_hash_admin', 'John', 'Admin', 'admin', 'IT'),
('manager@titanium.com', '$2b$10$example_hash_manager', 'Sarah', 'Manager', 'management', 'Operations'),
('prod@titanium.com', '$2b$10$example_hash_prod', 'Mike', 'Production', 'production', 'Manufacturing'),
('lab@titanium.com', '$2b$10$example_hash_lab', 'Dr. Lisa', 'Researcher', 'lab', 'R&D')
ON CONFLICT (email) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (title, description, file_path, category, status, created_by) VALUES
('Titanium Alloy Specifications', 'Technical specifications for Grade 5 titanium alloy', '/docs/titanium-grade5-specs.pdf', 'Technical', 'approved', 1),
('Quality Control Procedures', 'Standard operating procedures for quality control', '/docs/qc-procedures.pdf', 'Process', 'approved', 2),
('Safety Guidelines', 'Workplace safety guidelines for titanium processing', '/docs/safety-guidelines.pdf', 'Safety', 'approved', 1),
('Production Schedule Q1', 'First quarter production schedule', '/docs/prod-schedule-q1.pdf', 'Planning', 'draft', 3),
('Lab Test Results', 'Material testing results for batch #2024-001', '/docs/lab-results-2024-001.pdf', 'Testing', 'review', 4);

-- Insert sample dashboard metrics
INSERT INTO dashboard_metrics (metric_name, metric_value, metric_type, department) VALUES
('Production Efficiency', 94.5, 'percentage', 'Manufacturing'),
('Quality Score', 98.2, 'percentage', 'Quality'),
('Safety Incidents', 0, 'count', 'Safety'),
('Document Compliance', 96.8, 'percentage', 'Compliance'),
('Lab Test Completion', 87.3, 'percentage', 'R&D');

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES
(1, 'LOGIN', 'USER', 1, '{"login_method": "email"}'),
(2, 'DOCUMENT_CREATED', 'DOCUMENT', 2, '{"document_title": "Quality Control Procedures"}'),
(3, 'DOCUMENT_VIEWED', 'DOCUMENT', 1, '{"document_title": "Titanium Alloy Specifications"}'),
(4, 'REPORT_GENERATED', 'REPORT', 1, '{"report_type": "compliance"}');
