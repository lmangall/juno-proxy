#!/bin/sh

firebase functions:config:set notifications.token="secret"

firebase functions:config:set mail.resend.api_key="secret"
