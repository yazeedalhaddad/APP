-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role, department) VALUES
('admin@titanium.com', '$2b$10$example_hash_admin', 'John', 'Admin', 'admin', 'IT'),
('manager@titanium.com', '$2b$10$example_hash_manager', 'Sarah', 'Manager', 'management', 'Operations'),
('prod@titanium.com', '$2b$10$example_hash_prod', 'Mike', 'Production', 'production', 'Manufacturing'),
('lab@titanium.com', '$2b$10$example_hash_lab', 'Dr. Lisa', 'Researcher', 'lab', 'R&D')
ON CONFLICT (email) DO NOTHING;

-- Insert system administrator (password will be set via the secure seeding script)
INSERT INTO users (id, name, email, password, role, department, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'System Administrator', 'admin@medprep.com', '$2b$10$rOzJqZxQZ9VQZ9VQZ9VQZOzJqZxQZ9VQZ9VQZ9VQZOzJqZxQZ9VQZ', 'admin', 'IT', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (title, description, file_path, category, status, created_by) VALUES
('Titanium Alloy Specifications', 'Technical specifications for Grade 5 titanium alloy', '/docs/titanium-grade5-specs.pdf', 'Technical', 'approved', 1),
('Quality Control Procedures', 'Standard operating procedures for quality control', '/docs/qc-procedures.pdf', 'Process', 'approved', 2),
('Safety Guidelines', 'Workplace safety guidelines for titanium processing', '/docs/safety-guidelines.pdf', 'Safety', 'approved', 1),
('Production Schedule Q1', 'First quarter production schedule', '/docs/prod-schedule-q1.pdf', 'Planning', 'draft', 3),
('Lab Test Results', 'Material testing results for batch #2024-001', '/docs/lab-results-2024-001.pdf', 'Testing', 'review', 4);

INSERT INTO documents (id, title, description, file_type, classification, owner_id) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Manufacturing Protocol v2.1', 'Standard operating procedure for pharmaceutical manufacturing', 'pdf', 'SOP-Manufacturing', '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440001', 'Quality Control Guidelines', 'Quality control procedures and testing protocols', 'word', 'QC-Guidelines', '550e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440002', 'Regulatory Compliance Report Q4', 'Quarterly compliance report for regulatory authorities', 'excel', 'Regulatory-Report', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440003', 'Lab Safety Procedures', 'Laboratory safety protocols and emergency procedures', 'pdf', 'Safety-Protocol', '550e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440004', 'Production Schedule Template', 'Template for monthly production scheduling', 'excel', 'Production-Template', '550e8400-e29b-41d4-a716-446655440002');

-- Insert sample dashboard metrics
INSERT INTO dashboard_metrics (metric_name, metric_value, metric_type, department) VALUES
('Production Efficiency', 94.5, 'percentage', 'Manufacturing'),
('Quality Score', 98.2, 'percentage', 'Quality'),
('Safety Incidents', 0, 'count', 'Safety'),
('Document Compliance', 96.8, 'percentage', 'Compliance'),
('Lab Test Completion', 87.3, 'percentage', 'R&D'),
('System Initialized', 1, 'count', 'System')
ON CONFLICT (metric_name) DO NOTHING;

-- Insert document versions
INSERT INTO document_versions (id, document_id, version_number, is_official, file_path, file_size, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 1, true, '/documents/manufacturing-protocol-v1.pdf', 2048576, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 2, true, '/documents/manufacturing-protocol-v2.pdf', 2156789, '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 1, true, '/documents/qc-guidelines-v1.docx', 1024000, '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 1, true, '/documents/compliance-report-q4.xlsx', 512000, '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 1, true, '/documents/lab-safety-procedures.pdf', 1536000, '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample drafts
INSERT INTO drafts (id, document_id, name, description, creator_id, status, file_path, base_version_id) VALUES
('880e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Manufacturing Protocol v2.2 Draft', 'Updated manufacturing protocol with new safety measures', '550e8400-e29b-41d4-a716-446655440004', 'in_progress', '/drafts/manufacturing-protocol-v2.2-draft.pdf', '770e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'QC Guidelines Update', 'Updated quality control guidelines with new testing procedures', '550e8400-e29b-41d4-a716-446655440005', 'pending_approval', '/drafts/qc-guidelines-update.docx', '770e8400-e29b-41d4-a716-446655440002');

-- Insert sample merge requests
INSERT INTO merge_requests (id, draft_id, approver_id, summary, status) VALUES
('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Updated QC guidelines to include new FDA requirements and testing protocols for enhanced product safety', 'pending');

-- Insert sample audit log entries
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES
(1, 'LOGIN', 'USER', 1, '{"login_method": "email"}'),
(2, 'DOCUMENT_CREATED', 'DOCUMENT', 2, '{"document_title": "Quality Control Procedures"}'),
(3, 'DOCUMENT_VIEWED', 'DOCUMENT', 1, '{"document_title": "Titanium Alloy Specifications"}'),
(4, 'REPORT_GENERATED', 'REPORT', 1, '{"report_type": "compliance"}');

INSERT INTO audit_log (user_id, action, document_id, details) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'DOCUMENT_CREATED', '660e8400-e29b-41d4-a716-446655440000', '{"title": "Manufacturing Protocol v2.1", "classification": "SOP-Manufacturing"}'),
('550e8400-e29b-41d4-a716-446655440003', 'DOCUMENT_VIEWED', '660e8400-e29b-41d4-a716-446655440000', '{"version": 2}'),
('550e8400-e29b-41d4-a716-446655440004', 'DRAFT_CREATED', '660e8400-e29b-41d4-a716-446655440000', '{"draft_name": "Manufacturing Protocol v2.2 Draft"}'),
('550e8400-e29b-41d4-a716-446655440005', 'MERGE_REQUEST_CREATED', '660e8400-e29b-41d4-a716-446655440001', '{"merge_request_id": "990e8400-e29b-41d4-a716-446655440000"}'),
('550e8400-e29b-41d4-a716-446655440001', 'DOCUMENT_APPROVED', '660e8400-e29b-41d4-a716-446655440002', '{"version": 1, "approver": "Dr. Sarah Johnson"}');

-- Insert document permissions
INSERT INTO document_permissions (document_id, user_id, permission_type, granted_by) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'approve', '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'read', '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'write', '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'approve', '550e8400-e29b-41d4-a716-446655440000'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'write', '550e8400-e29b-41d4-a716-446655440000');
