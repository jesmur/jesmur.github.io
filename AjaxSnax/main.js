"use strict";

$(document).ready(function()
{
    $("#loader").show();

    let randomMealURL = "https://www.themealdb.com/api/json/v1/1/random.php";
    let categoriesURL = "https://www.themealdb.com/api/json/v1/1/categories.php";
    let categorySearchURL = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
    let mealDetailsURL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    let searchMealByName = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

    let categoryDiv = $("#categoriesDisplay");
    let recipeDiv = $("#recipeDisplay");
    let mainDiv = $("#mainDisplay")

    let numRandomRecipes = 9;

    emptyDivs();

    $("#loader").show();

    recipeDiv.hide();
    categoryDiv.hide();
    
    for(let i =0; i < numRandomRecipes; i++){
        $.ajax({
            url: randomMealURL,
            method: 'GET',
        }).done(function(responseJSON){
            let meal = "<img class='recipe img-fluid' id='"+responseJSON.meals[0].idMeal+"' src='"+responseJSON.meals[0].strMealThumb+"'></img>";
            $("#recipe-"+(i+1)).append(meal);
        }).always(function(){
            $("#loader").hide();
        }).fail(function(){
            $("#error").text("Error retrieving recipes. Try again later.").show();
        });
    }
         
    mainDiv.show();

    $(".carousel").slick({
        infinite: false,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true
    });

    $.ajax({
        url: categoriesURL,
        method: 'GET',
    }).done(function(responseJSON){
        responseJSON.categories.forEach(function(categories){
            $("#navbarCategoryDropdown").append("<a class='dropdown-item categoriesBtn' href='#'>" + categories.strCategory + "</a>");
        });
    }).always(function(){
        $("#loader").hide();
    }).fail(function(){
        $("#error").text("Error retrieving recipes. Try again later.").show();
    });

    $("#mainDisplayBtn").click(function(){
        window.location.reload()
    });

    $("#navbarCategoryDropdown").on('click', '.categoriesBtn', function(){
        $("#loader").show();
        emptyDivs();

        mainDiv.hide();
        recipeDiv.hide();
        categoryDiv.show();
    
        let category = $(this).html();
        categoryDiv.append("<hr><h1>"+category+" Recipes</h1><hr>")

        $.ajax({
            url: categorySearchURL + category,
            method: 'GET',
        }).done(function(responseJSON){
            appendMeals(responseJSON);
        }).always(function(){
            $("#loader").hide();
        }).fail(function(){
            $("#error").text("Error retrieving recipes. Try again later.").show();
        });
    });

    $(".container").on('click', '.recipe', function(){

        $("#loader").show();
        emptyDivs();

        mainDiv.hide();
        recipeDiv.show();
        categoryDiv.hide();

        let mealId = $(this).attr('id');
     
        $.ajax({
            url: mealDetailsURL + mealId,
            method: 'GET',
        }).done(function(responseJSON){

            recipeDiv.append("<hr><h1>"+responseJSON.meals[0].strMeal+"</h1><hr>");
            recipeDiv.append("<div class='row'><div class='col-lg-12 text-center'><img class='img-fluid' src='"+responseJSON.meals[0].strMealThumb+"'></img></div></div>");
            
            var ingredients = [];
            var measurements = [];

            for (let key in responseJSON.meals[0]){
                if (key.includes('strIngredient')){
                    if(responseJSON.meals[0][key] !== "" && responseJSON.meals[0][key] !== null){
                        ingredients.push(responseJSON.meals[0][key]);
                    }
                }
                
                if (key.includes('strMeasure')){
                    if(responseJSON.meals[0][key] !== "" && responseJSON.meals[0][key] !== null){
                        measurements.push(responseJSON.meals[0][key]);
                    }
                }
            }

            recipeDiv.append("<hr><div class='row'><div class='col-lg-6 col-12'><h2>Ingredients</h2><ul>");

            for (let i = 0; i < ingredients.length; i++){
                recipeDiv.append("<li>"+ measurements[i] + " " + ingredients[i] +"</li>");
            }

            recipeDiv.append("</ul></div></div><hr>")

            let mealInstructions = responseJSON.meals[0].strInstructions;
            let inst = mealInstructions.replace(/\r\n/g, "<br>");

            recipeDiv.append("<div class='row'><div class='col-lg-6 col-12'><h2>Directions</h2>");
            recipeDiv.append("<div class='row'><div class='col-12'><p>" + inst +"</p></div></div>");

        }).always(function(){
            $("#loader").hide();
        }).fail(function(){
            $("#error").text("Error retrieving recipe. Try again later.").show();
        });
    
    });

    $('#searchBtn').click(function() {
        let search = $("#recipeSearch").val().trim();

        if(search !== ""){
            $("#loader").show();
            emptyDivs();
            mainDiv.hide();
            recipeDiv.hide();
            categoryDiv.show();
    
            categoryDiv.append("<hr><h1>Results for recipes containing \""+search+"\"</h1><hr>");
    
            $.ajax({
                url: searchMealByName + search,
                method: 'GET',
            }).done(function(responseJSON){
                appendMeals(responseJSON);
            }).always(function(){
                $("#loader").hide();
            }).fail(function(){
                $("#error").text("Error retrieving recipes. Try again later.").show();
            });   
        }
    });


    function emptyDivs(){
        categoryDiv.empty();
        recipeDiv.empty();  
        clearRandomRecipes(numRandomRecipes);
    }

    function clearRandomRecipes(numRecipes){
        for(let i = 0; i < numRecipes; i++){
            $("#recipe-"+(i+1)).empty();
        }
    }

    function appendMeals(responseJSON){
        if(responseJSON.meals != null){
            let count = Object.keys(responseJSON.meals).length;

            let index = 0;
            let mealCols = "";
            
            if(count < 3){
                responseJSON.meals.forEach(function(meal){
                    let newMeal = "<div class='col-md-4 col-12' href='#'><a href='#' class='recipe' id="+
                    meal.idMeal+"><img class='img-fluid' src=" +
                    meal.strMealThumb + "></img></a><p>"+meal.strMeal+"</p></div>";
                    mealCols += newMeal;
                    if(index === (count-1)){
                        categoryDiv.append("<div class='row'>" + mealCols + "</div>");
                        mealCols = "";
                        index = 0;
                    }
                    else{
                        index++;
                    }
                });   
            }
            else if(count % 3 === 0){
                responseJSON.meals.forEach(function(meal){
                    let newMeal = "<div class='col-md-4 col-12' href='#'><a href='#' class='recipe' id="+
                    meal.idMeal+"><img class='img-fluid' src="+meal.strMealThumb+"></img></a><p>"+meal.strMeal+"</p></div>";
                    mealCols += newMeal;
                    if(index === 2){
                        categoryDiv.append("<div class='row'>" + mealCols + "</div>");
                        mealCols = "";
                        index = 0;
                    }
                    else{
                        index++;
                    }
                });   
            }
            else {
                let numRows = Math.floor(count/3) + 1;
                let rowCount = 1;
                let numRecipes = 1;
                responseJSON.meals.forEach(function(meal){
                    let newMeal = "<div class='col-md-4 col-12' href='#'><a href='#' class='recipe' id="+meal.idMeal+"><img class='img-fluid' src=" +
                    meal.strMealThumb + "></img></a><p>"+meal.strMeal+"</p></div>";
                    mealCols += newMeal;
                    if(index === 2){
                        categoryDiv.append("<div class='row'>"+mealCols+"</div>");
                        mealCols = "";
                        index = 0;
                        rowCount++;
                    }
                    else if(rowCount === numRows && numRecipes === count){
                        categoryDiv.append("<div class='row'>"+mealCols+"</div>");
                    }
                    else{
                        index++;
                    }
                    numRecipes++;
                });
            } 
        }
        else{
            categoryDiv.append("<p>No results found.</p>")
        }
    }
});