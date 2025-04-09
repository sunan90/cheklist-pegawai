<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login Checklist Pegawai</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container login-container">
    <h2>Login Pegawai</h2>
    <form id="loginForm">
      <label for="username">Nama:</label>
      <input type="text" id="username" name="username" required />

      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required />

      <button type="submit">Login</button>
    </form>
    <div id="loginMessage"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>
