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

func addWordHandler(c echo.Context) error {
	word, err := getWordValue(c)
	if err != nil {
		return err
	}
	if err := db.InsertWord(word); err != nil {
		return err
	}
	return c.JSON(OK, Text{word.ID})
}

func getWordValue(c echo.Context) (word *Word, err error) {
	w := new(Word)
	if err = c.Bind(w); err != nil {
		return
	}
	word = new(Word)
	word.CN = strings.TrimSpace(w.CN)
	word.EN = strings.TrimSpace(w.EN)
	word.JP = strings.TrimSpace(w.JP)
	if word.EN+word.CN+word.JP == "" {
		return nil, fmt.Errorf("CN, EN, JP 必须至少填写一个")
	}
	word.Kana = strings.TrimSpace(w.Kana)
	word.Label = strings.TrimSpace(w.Label)
	word.Notes = strings.TrimSpace(w.Notes)
	word.Links = w.Links
	return
}
