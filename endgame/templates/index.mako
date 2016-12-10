<!DOCTYPE html>
<html lang="en" ng-app="myBS">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="shortcut icon" href="${ url_for('static', filename='favicon.ico') }">
  <title>What Magic Is This?</title>
  <script type="text/javascript" src="/static/lib/angular/angular.min.js"></script>
  <script type="text/javascript" src="/static/lib/angular/angular-route.min.js"></script>
  <script type="text/javascript" src="/static/js/bs.js"></script>
  <script type="text/javascript" src="/static/js/controllers.js"></script>
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
  <style type="text/css">
    body {
      padding-top: 50px;
    }
    .starter-template {
      padding: 40px 15px;
    }
    .center {
      text-align: center;
    }
  </style>
</head>
<body>
  <nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">Welcome to <span class="text-danger">Genetic-Endgame</span></a>
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <form class="navbar-form navbar-right">
          <a class="btn btn-primary" ng-href="#!/about">About</a>
        </form>
      </div><!--/.navbar-collapse -->
    </div>
  </nav>
  <div class="starter-template">
    <div ng-view>
    </div>
    <div class="container">
      % for user in users:
      user is ${user.username}
      % endfor
    </div>
  </div>
  <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
  <!-- Latest compiled and minified JavaScript -->
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
</body>
</html>