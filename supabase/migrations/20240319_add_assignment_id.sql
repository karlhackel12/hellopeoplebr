-- Adicionar coluna assignment_id na tabela conversation_sessions
ALTER TABLE conversation_sessions
ADD COLUMN assignment_id UUID REFERENCES student_assignments(id);

-- Adicionar índice para melhorar performance
CREATE INDEX idx_conversation_sessions_assignment_id ON conversation_sessions(assignment_id);

-- Atualizar registros existentes para permitir NULL
UPDATE conversation_sessions
SET assignment_id = NULL
WHERE assignment_id IS NULL; 