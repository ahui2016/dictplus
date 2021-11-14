package main

import "github.com/labstack/echo/v4"

func main() {
	defer db.DB.Close()

	e := echo.New()
	e.IPExtractor = echo.ExtractIPFromXFFHeader()
	e.HTTPErrorHandler = errorHandler

	e.Static("/public", "public")
	e.File("/", "public/index.html")

	api := e.Group("/api", sleep)
	api.POST("/get-word", getWordHandler)
	api.POST("/add-word", addWordHandler)
	api.POST("/update-word", updateWordHandler)
	api.POST("/delete-word", deleteWordHandler)

	e.Logger.Fatal(e.Start(*addr))
}
