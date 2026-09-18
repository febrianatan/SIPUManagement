<?php

use App\Models\User;

test('registration screen is disabled', function () {
    $response = $this->get('/register');

    $response->assertNotFound();
});

test('users cannot self register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'register-test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertNotFound();

    $this->assertGuest();

    $this->assertDatabaseMissing('users', [
        'email' => 'register-test@example.com',
    ]);
});
