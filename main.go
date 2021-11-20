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
	api.POST("/search-words", searchHandler)
	api.GET("/count-words", countHandler)
	api.GET("/get-history", getHistoryHandler)
	api.POST("/update-history", updateHistory)
	api.GET("/get-recent-labels", getRecentLabels)
	api.GET("/get-settings", getSettingsHandler)
	api.POST("/update-settings", updateSettings)

	e.Logger.Fatal(e.Start(*addr))
}
