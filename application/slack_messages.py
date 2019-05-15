# Helper functions for constructing messages for Slack to digest and send
import json

def simple_message(text):
    return {
        "text": text 
    }

def block_message(text, blocks):
    return {
        "text": text,
        "blocks": blocks
    }

def columns(column_a, column_b):
    field_text = []
    for i in range(max(len(column_a), len(column_b))):
        field_text.append( column_a[i] if i < len(column_a) else " ")
        field_text.append( column_b[i] if i < len(column_b) else " ")
    return {
        "type": "section",
        "fields": [{"type":"mrkdwn","text":text} for text in field_text]
    }

def section(text):
    return {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": text
        }
    }

def sections(*text_list):
    return [section(text) for text in text_list]

def context(text):
    return {
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": text
            }
        ]
    }

def actions(elements):
    return {
        "type": "actions",
        "elements": elements
    }

def button(text, action_type, action_payload, style="primary"):
    return {
        "type": "button",
        "text": {
            "type": "plain_text",
            "emoji": True,
            "text": text
        },
        "style": style,
        "value": json.dumps({
            "type": action_type, 
            "payload": action_payload
        })
    }

def divider():
    return {
        "type": "divider"
    }

