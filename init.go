package main

import (
	"flag"
	"net/http"

	"ahui2016.github.com/dictplus/database"
	"ahui2016.github.com/dictplus/model"
	"ahui2016.github.com/dictplus/util"
)

type (
	Word     = model.Word
	Settings = model.Settings
)

const (
	OK         = http.StatusOK
	dbFileName = "db-dictplus.sqlite"
)

var (
	db   = new(database.DB)
	addr = flag.String("addr", "", "local IP address")
)

func init() {
	flag.Parse()
	util.Panic(db.Open(dbFileName))
	if *addr == "" {
		s, err := db.GetSettings()
		util.Panic(err)
		*addr = s.DictplusAddr
	}
}
