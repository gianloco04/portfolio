<?php
// Cambia esto por tu email real
$your_email = "info@ceresdesigns.com";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Verificar que la checkbox de privacidad esté marcada
    if (!isset($_POST['privacy-checkbox'])) {
        die("You must accept the privacy policy.");
    }

    // Formulario Contacto
    if (isset($_POST['contact_submit'])) {
        $name = strip_tags(trim($_POST["name"]));
        $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
        $subject = strip_tags(trim($_POST["about"]));
        $message = trim($_POST["message"]);

        if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($subject) || empty($message)) {
            die("Please complete the form correctly.");
        }

        $email_content = "Name: $name\n";
        $email_content .= "Email: $email\n\n";
        $email_content .= "Subject: $subject\n\n";
        $email_content .= "Message:\n$message\n";

        $email_headers = "From: $name <$email>";

        if (mail($your_email, $subject, $email_content, $email_headers)) {
            echo "Thank you! Your message has been sent.";
        } else {
            echo "Oops! Something went wrong and we couldn't send your message.";
        }
    }

    // Formulario Newsletter
    if (isset($_POST['newsletter_submit'])) {
        $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            die("Please enter a valid email.");
        }

        // Guardar el email en un archivo (simple)
        $file = 'newsletter_list.txt';
        // Revisar si ya está guardado para evitar duplicados
        $current_emails = file_exists($file) ? file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];

        if (!in_array($email, $current_emails)) {
            file_put_contents($file, $email . PHP_EOL, FILE_APPEND);
            echo "Thanks for subscribing to the newsletter!";
        } else {
            echo "You are already subscribed.";
        }
    }
} else {
    echo "Invalid request.";
}
?>
