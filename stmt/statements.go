package stmt

const CreateTables = `

CREATE TABLE IF NOT EXISTS word
(
	id       text   PRIMARY KEY COLLATE NOCASE,
	cn       text   NOT NULL,
	en       text   NOT NULL,
	jp       text   NOT NULL,
	kana     text   NOT NULL,
	other    text   NOT NULL,
	label    text   NOT NULL,
	notes    text   NOT NULL,
	links    text   NOT NULL,
	images   text   NOT NULL,
	ctime    int    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_word_cn ON word(cn);
CREATE INDEX IF NOT EXISTS idx_word_en ON word(en);
CREATE INDEX IF NOT EXISTS idx_word_jp ON word(jp);
CREATE INDEX IF NOT EXISTS idx_word_kana ON word(kana);
CREATE INDEX IF NOT EXISTS idx_word_other ON word(other);
CREATE INDEX IF NOT EXISTS idx_word_label ON word(label);
CREATE INDEX IF NOT EXISTS idx_word_ctime ON word(ctime);

CREATE TABLE IF NOT EXISTS metadata
(
  name         text   NOT NULL UNIQUE,
  int_value    int    NOT NULL DEFAULT 0,
  text_value   text   NOT NULL DEFAULT "" 
);
`
const InsertIntValue = `INSERT INTO metadata (name, int_value) VALUES (?, ?);`
const GetIntValue = `SELECT int_value FROM metadata WHERE name=?;`
const UpdateIntValue = `UPDATE metadata SET int_value=? WHERE name=?;`

const InsertTextValue = `INSERT INTO metadata (name, text_value) VALUES (?, ?);`
const GetTextValue = `SELECT text_value FROM metadata WHERE name=?;`
const UpdateTextValue = `UPDATE metadata SET text_value=? WHERE name=?;`

const DeleteWord = `DELETE FROM word WHERE id=?;`

const GetWordByID = `SELECT * FROM word WHERE id=?;`

const CountAllWords = `SELECT count(*) FROM word;`

// 由于要除重，最终会失去顺序，因此这里不用 order by
const GetAllLabels = `SELECT label FROM word;`

const InsertWord = `INSERT INTO word (
	id, cn, en, jp, kana, other, label, notes, links, images, ctime
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`

const UpdateWord = `UPDATE word SET
	cn=?, en=?, jp=?, kana=?, other=?, label=?, notes=?, links=?, images=?
	WHERE id=?;`

const NewWords = `SELECT * FROM word ORDER BY ctime DESC LIMIT ?;`

const GetByLabel = `
	SELECT * FROM word WHERE label LIKE ? ORDER BY ctime DESC LIMIT ?;`

const GetByEmptyLabel = `
	SELECT * FROM word WHERE label='' ORDER BY ctime DESC LIMIT ?;`
