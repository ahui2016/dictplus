package stmt

const CreateTables = `

CREATE TABLE IF NOT EXISTS word
(
	id       text    PRIMARY KEY COLLATE NOCASE,
	cn       text    NOT NULL,
	en       text    NOT NULL,
	jp       text    NOT NULL,
	kana     text    NOT NULL,
	label    text    NOT NULL,
	notes    text    NOT NULL,
	links    blob    DEFAULT NULL,
	images   blob    DEFAULT NULL,
	ctime    int     NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_word_id ON word(id);
CREATE INDEX IF NOT EXISTS idx_word_cn ON word(cn);
CREATE INDEX IF NOT EXISTS idx_word_en ON word(en);
CREATE INDEX IF NOT EXISTS idx_word_jp ON word(jp);
CREATE INDEX IF NOT EXISTS idx_word_kana ON word(kana);
CREATE INDEX IF NOT EXISTS idx_word_label ON word(label);
CREATE INDEX IF NOT EXISTS idx_word_ctime ON word(ctime);

CREATE TABLE IF NOT EXISTS metadata
(
  name         text    NOT NULL UNIQUE,
  int_value    int     NOT NULL DEFAULT 0,
  text_value   text    NOT NULL DEFAULT "" 
);
`
const InsertIntValue = `INSERT INTO metadata (name, int_value) VALUES (?, ?);`
const GetIntValue = `SELECT int_value FROM metadata WHERE name=?;`
const UpdateIntValue = `UPDATE metadata SET int_value=? WHERE name=?;`

const InsertTextValue = `INSERT INTO metadata (name, text_value) VALUES (?, ?);`
const GetTextValue = `SELECT text_value FROM metadata WHERE name=?;`
const UpdateTextValue = `UPDATE metadata SET text_value=? WHERE name=?;`

const InsertWord = `INSERT INTO word (
	id, cn, en, jp, kana, label, notes, links, images, ctime
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
