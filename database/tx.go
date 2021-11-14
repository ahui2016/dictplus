package database

import (
	"database/sql"

	"ahui2016.github.com/dictplus/stmt"
)

type TX interface {
	Exec(string, ...interface{}) (sql.Result, error)
	Query(string, ...interface{}) (*sql.Rows, error)
	QueryRow(string, ...interface{}) *sql.Row
}

// getText1 gets one text value from the database.
func getText1(tx TX, query string, args ...interface{}) (text string, err error) {
	row := tx.QueryRow(query, args...)
	err = row.Scan(&text)
	return
}

// getInt1 gets one number value from the database.
func getInt1(tx TX, query string, arg ...interface{}) (n int64, err error) {
	row := tx.QueryRow(query, arg...)
	err = row.Scan(&n)
	return
}

type Row interface {
	Scan(...interface{}) error
}

func insertWord(tx TX, w *Word) error {
	_, err := tx.Exec(
		stmt.InsertWord,
		w.ID,
		w.CN,
		w.EN,
		w.JP,
		w.Kana,
		w.Other,
		w.Label,
		w.Notes,
		w.Links,
		w.Images,
		w.CTime,
	)
	return err
}

func scanWord(row Row) (w Word, err error) {
	err = row.Scan(
		&w.ID,
		&w.CN,
		&w.EN,
		&w.JP,
		&w.Kana,
		&w.Other,
		&w.Label,
		&w.Notes,
		&w.Links,
		&w.Images,
		&w.CTime,
	)
	return
}

func updateWord(tx TX, w *Word) error {
	_, err := tx.Exec(
		stmt.UpdateWord,
		w.CN,
		w.EN,
		w.JP,
		w.Kana,
		w.Other,
		w.Label,
		w.Notes,
		w.Links,
		w.Images,
		w.ID,
	)
	return err
}
