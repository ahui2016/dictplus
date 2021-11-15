package database

import (
	"database/sql"

	"ahui2016.github.com/dictplus/model"
	"ahui2016.github.com/dictplus/stmt"
)

const (
	word_id_key    = "word-id-key"
	word_id_prefix = "W"
	history_id_key = "history-id-key" // 搜索历史，用换行符分隔
)

func getTextValue(key string, tx TX) (value string, err error) {
	row := tx.QueryRow(stmt.GetTextValue, key)
	err = row.Scan(&value)
	return
}

func UpdateTextValue(key, v string, tx TX) error {
	_, err := tx.Exec(stmt.UpdateTextValue, v, key)
	return err
}

func getIntValue(key string, tx TX) (value int64, err error) {
	row := tx.QueryRow(stmt.GetIntValue, key)
	err = row.Scan(&value)
	return
}

func getCurrentID(key string, tx TX) (id model.ShortID, err error) {
	strID, err := getTextValue(key, tx)
	if err != nil {
		return
	}
	return model.ParseID(strID)
}

func initFirstID(key, prefix string, tx TX) (err error) {
	_, err = getCurrentID(key, tx)
	if err == sql.ErrNoRows {
		id, err1 := model.FirstID(prefix)
		if err1 != nil {
			return err1
		}
		_, err = tx.Exec(stmt.InsertTextValue, key, id.String())
	}
	return
}

func getNextID(tx TX, key string) (nextID string, err error) {
	currentID, err := getCurrentID(key, tx)
	if err != nil {
		return
	}
	nextID = currentID.Next().String()
	err = UpdateTextValue(key, nextID, tx)
	return
}

func initHistory(tx TX) error {
	_, err := tx.Exec(stmt.InsertTextValue, history_id_key, "")
	return err
}

func (db *DB) GetHistory() (string, error) {
	return getTextValue(history_id_key, db.DB)
}

func (db *DB) UpdateHistory(v string) error {
	return UpdateTextValue(history_id_key, v, db.DB)
}
