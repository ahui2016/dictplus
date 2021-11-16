package main

import (
	"fmt"
	"strings"
	"time"

	"ahui2016.github.com/dictplus/util"
	"github.com/labstack/echo/v4"
)

// Text 用于向前端返回一个简单的文本消息。
// 为了保持一致性，总是向前端返回 JSON, 因此即使是简单的文本消息也使用 JSON.
type Text struct {
	Message string `json:"message"`
}

type Number struct {
	N int64 `json:"n"`
}

func sleep(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		time.Sleep(time.Second)
		return next(c)
	}
}

func errorHandler(err error, c echo.Context) {
	if e, ok := err.(*echo.HTTPError); ok {
		c.JSON(e.Code, e.Message)
	}
	util.Panic(c.JSON(500, Text{err.Error()}))
}

func getWordHandler(c echo.Context) error {
	id := c.FormValue("id")
	w, err := db.GetWordByID(id)
	if err != nil {
		return err
	}
	return c.JSON(OK, w)
}

func deleteWordHandler(c echo.Context) error {
	id := c.FormValue("id")
	if _, err := db.GetWordByID(id); err != nil {
		return err
	}
	return db.DeleteWord(id)
}

func addWordHandler(c echo.Context) error {
	w, err := getWordValue(c)
	if err != nil {
		return err
	}
	if err := db.InsertNewWord(w); err != nil {
		return err
	}
	return c.JSON(OK, Text{w.ID})
}

func updateWordHandler(c echo.Context) error {
	w, err := getWordValue(c)
	if err != nil {
		return err
	}
	if w.ID == "" {
		return fmt.Errorf("id is empty, need an id")
	}
	// 确保 w.ID 存在于数据库中
	if _, err = db.GetWordByID(w.ID); err != nil {
		return err
	}
	return db.UpdateWord(w)
}

func countHandler(c echo.Context) error {
	n, err := db.CountAllWords()
	if err != nil {
		return err
	}
	return c.JSON(OK, Number{n})
}

func searchHandler(c echo.Context) error {
	type form struct {
		Pattern string   `json:"pattern"`
		Fields  []string `json:"fields"`
	}
	f := new(form)
	if err := c.Bind(f); err != nil {
		return err
	}
	words, err := db.GetWords(strings.TrimSpace(f.Pattern), f.Fields)
	if err != nil {
		return err
	}
	return c.JSON(OK, words)
}

func getHistoryHandler(c echo.Context) error {
	history, err := db.GetHistory()
	if err != nil {
		return err
	}
	return c.JSON(OK, Text{history})
}

func updateHistory(c echo.Context) error {
	history, err := getFormValue(c, "history")
	if err != nil {
		return err
	}
	return db.UpdateHistory(history)
}

// getFormValue gets the c.FormValue(key), trims its spaces,
// and checks if it is empty or not.
func getFormValue(c echo.Context, key string) (string, error) {
	value := strings.TrimSpace(c.FormValue(key))
	if value == "" {
		return "", fmt.Errorf("form value [%s] is empty", key)
	}
	return value, nil
}

func getWordValue(c echo.Context) (word *Word, err error) {
	w := new(Word)
	if err = c.Bind(w); err != nil {
		return
	}
	word = new(Word)
	word.ID = strings.TrimSpace(w.ID)
	word.CN = strings.TrimSpace(w.CN)
	word.EN = strings.TrimSpace(w.EN)
	word.JP = strings.TrimSpace(w.JP)
	word.Kana = strings.TrimSpace(w.Kana)
	word.Other = strings.TrimSpace(w.Other)
	if word.EN+word.CN+word.JP+word.Other == "" {
		return nil, fmt.Errorf("必须至少填写一个: CN, EN, JP, Other")
	}
	if word.Kana != "" && word.JP == "" {
		return nil, fmt.Errorf("如果填写了 Kana, 就必须填写 JP")
	}
	word.Label = strings.TrimSpace(w.Label)
	word.Notes = strings.TrimSpace(w.Notes)
	word.Links = strings.TrimSpace(w.Links)
	word.Images = strings.TrimSpace(w.Images)
	return
}
