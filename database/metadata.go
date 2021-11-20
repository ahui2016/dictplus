package database

import (
	"database/sql"

	"ahui2016.github.com/dictplus/model"
	"ahui2016.github.com/dictplus/stmt"
	"ahui2016.github.com/dictplus/util"
)

const (
	word_id_key        = "word-id-key"
	word_id_prefix     = "W"
	history_id_key     = "history-id-key" // 搜索历史，用换行符分隔
	dictplus_addr_key  = "dictplus-address"
	localtags_addr_key = "localtags-address"
)

func getTextValue(key string, tx TX) (value string, err error) {
	row := tx.QueryRow(stmt.GetTextValue, key)
	err = row.Scan(&value)
	return
}

func updateTextValue(key, v string, tx TX) error {
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
	err = updateTextValue(key, nextID, tx)
	return
}

func (db *DB) initTextEntry(k, v string) error {
	_, err := getTextValue(k, db.DB)
	if err == sql.ErrNoRows {
		err = db.Exec(stmt.InsertTextValue, k, v)
	}
	return err
}

func (db *DB) GetHistory() (string, error) {
	return getTextValue(history_id_key, db.DB)
}

func (db *DB) UpdateHistory(v string) error {
	return updateTextValue(history_id_key, v, db.DB)
}

func (db *DB) GetSettings() (Settings, error) {
	addr1, e1 := getTextValue(dictplus_addr_key, db.DB)
	addr2, e2 := getTextValue(localtags_addr_key, db.DB)
	return Settings{DictplusAddr: addr1, LocaltagsAddr: addr2}, util.WrapErrors(e1, e2)
}

func (db *DB) UpdateSettings(s Settings) error {
	e1 := updateTextValue(dictplus_addr_key, s.DictplusAddr, db.DB)
	e2 := updateTextValue(localtags_addr_key, s.LocaltagsAddr, db.DB)
	return util.WrapErrors(e1, e2)
}
