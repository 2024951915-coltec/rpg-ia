PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS usuarios(id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE, senha TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS salas(id TEXT PRIMARY KEY, host INTEGER REFERENCES usuarios(id), nome TEXT, tema TEXT, modo_mapa TEXT DEFAULT 'auto', campanha TEXT, etapa INTEGER DEFAULT 0, turno INTEGER DEFAULT 0, conflito TEXT, rodada INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS personagens(id INTEGER PRIMARY KEY, sala TEXT REFERENCES salas(id), usuario INTEGER REFERENCES usuarios(id), classe TEXT, aparencia TEXT, ficha TEXT, avatar TEXT, inventario TEXT DEFAULT '["Poção de cura"]', UNIQUE(sala,usuario));
CREATE TABLE IF NOT EXISTS mapas_cenarios(id INTEGER PRIMARY KEY, sala TEXT REFERENCES salas(id), etapa INTEGER, nome TEXT, descricao TEXT, imagem TEXT, UNIQUE(sala,etapa));
CREATE TABLE IF NOT EXISTS mensagens(id INTEGER PRIMARY KEY, sala TEXT REFERENCES salas(id), usuario INTEGER REFERENCES usuarios(id), autor TEXT, texto TEXT);
