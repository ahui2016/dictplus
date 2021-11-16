package database

import (
	"database/sql"
	"fmt"

	"ahui2016.github.com/dictplus/model"
	"ahui2016.github.com/dictplus/stmt"
	"ahui2016.github.com/dictplus/util"

	_ "github.com/mattn/go-sqlite3"
)

const (
	NewWordsLimit = 30
	PageLimit     = 100 // 搜索结果每页上限
)

type (
	Word = model.Word
)

type DB struct {
	Path string
	DB   *sql.DB
}

func (db *DB) mustBegin() *sql.Tx {
	tx, err := db.DB.Begin()
	util.Panic(err)
	return tx
}

func (db *DB) Exec(query string, args ...interface{}) (err error) {
	_, err = db.DB.Exec(query, args...)
	return
}

func (db *DB) Open(dbPath string) (err error) {
	if db.DB, err = sql.Open("sqlite3", dbPath+"?_fk=1"); err != nil {
		return
	}
	db.Path = dbPath
	if err = db.Exec(stmt.CreateTables); err != nil {
		return
	}
	e1 := initFirstID(word_id_key, word_id_prefix, db.DB)
	e2 := db.initHistory()
	return util.WrapErrors(e1, e2)
}

func (db *DB) GetWordByID(id string) (w Word, err error) {
	row := db.DB.QueryRow(stmt.GetWordByID, id)
	w, err = scanWord(row)
	if err == sql.ErrNoRows {
		err = fmt.Errorf("not found (id:%s)", id)
	}
	return
}

func (db *DB) CountAllWords() (int64, error) {
	return getInt1(db.DB, stmt.CountAllWords)
}

func (db *DB) DeleteWord(id string) error {
	return db.Exec(stmt.DeleteWord, id)
}

func (db *DB) InsertNewWord(w *Word) (err error) {
	tx := db.mustBegin()
	defer tx.Rollback()

	if w.ID, err = getNextID(tx, word_id_key); err != nil {
		return
	}
	w.CTime = util.TimeNow()
	if err = insertWord(tx, w); err != nil {
		return
	}
	return tx.Commit()
}

func (db *DB) UpdateWord(w *Word) error {
	return updateWord(db.DB, w)
}

func (db *DB) GetWords(pattern string, fields []string) (words []*Word, err error) {
	if len(fields) == 0 {
		return nil, fmt.Errorf("no field to search")
	}
	if pattern == "" {
		return nil, fmt.Errorf("nothing to search")
	}

	var rows *sql.Rows

	query := "SELECT * FROM word where"

	if fields[0] == "Recently-Added" {
		rows, err = db.DB.Query(stmt.NewWords, NewWordsLimit)
	} else if len(fields) == 1 && fields[0] == "Label" {
		rows, err = db.DB.Query(stmt.GetByLabel, pattern+"%", PageLimit)
	} else {
		for i, field := range fields {
			if i == 0 {
				query += fmt.Sprintf(" %s LIKE ?", field)
			} else {
				query += fmt.Sprintf(" OR %s LIKE ?", field)
			}
		}
		query += " ORDER BY ctime DESC LIMIT ?;"
		// 拼接后的 query 大概像这个样子 SELECT * FROM word WHERE CN LIKE ? OR EN LIKE ? OR JP LIKE ? ORDER BY ctime DESC LIMIT ?;
		args := []interface{}{}
		pattern = "%" + pattern + "%"
		for range fields {
			args = append(args, pattern)
		}
		args = append(args, PageLimit)
		rows, err = db.DB.Query(query, args...)
	}
	defer rows.Close()

	for rows.Next() {
		w, err := scanWord(rows)
		if err != nil {
			return nil, err
		}
		words = append(words, &w)
	}
	err = rows.Err()
	return
}
