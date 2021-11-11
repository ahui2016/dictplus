package main

import (
	"flag"
	"net/http"

	"ahui2016.github.com/dictplus/database"
	"ahui2016.github.com/dictplus/model"
	"ahui2016.github.com/dictplus/util"
)

type (
	Word = model.Word
)

const (
	OK         = http.StatusOK
	dbFileName = "db-dictplus.sqlite"
)

var (
	password string
	db       = new(database.DB)
	addr     = flag.String("addr", "127.0.0.1:80", "local IP address")
)

func init() {
	flag.Parse()
	util.Panic(db.Open(dbFileName))
}
