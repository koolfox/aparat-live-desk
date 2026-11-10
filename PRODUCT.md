# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Static HTML, CSS and JavaScript without dependencies, for lightweight use.

## Users
The owner manages an Aparat live stream using OBS on Mac and potentially Windows.

## Product Purpose
Make it easy to see and control the current OBS broadcast and reach Aparat session and chat controls.

## Operating Context
OBS provides a WebSocket connection; Aparat remains responsible for its live session and chat administration.

## Capabilities and Constraints
Prioritize OBS status, scenes, audio, and an explicit link to Aparat's own chat management. Never present unavailable chat permissions as functional. Keep credentials in memory and avoid storing stream keys.
