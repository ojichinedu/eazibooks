<?php

return [
    'capture' => [
        'mode' => env('LIEGE_CAPTURE_MODE', 'local'),
        'meta_verify_token' => env('META_WHATSAPP_VERIFY_TOKEN'),
        'meta_access_token' => env('META_WHATSAPP_ACCESS_TOKEN'),
        'meta_phone_number_id' => env('META_WHATSAPP_PHONE_NUMBER_ID'),
        'default_business_id' => env('LIEGE_META_DEFAULT_BUSINESS_ID'),
        'openai_api_key' => env('OPENAI_API_KEY'),
        'google_vision_api_key' => env('GOOGLE_VISION_API_KEY'),
    ],
];