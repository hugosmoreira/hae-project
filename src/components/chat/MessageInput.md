# MessageInput Component

A reusable, feature-rich message input component for chat applications with multiline support, send functionality, and disabled states.

## Features

### ✅ **Core Functionality**
- **Multiline Text Input**: Auto-resizing textarea with max height
- **Send Button**: Integrated send button with loading states
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Disabled States**: Proper disabled state while sending
- **Character Limit**: Configurable max length with visual feedback

### ✅ **User Experience**
- **Auto-resize**: Textarea grows with content up to max height
- **Visual Feedback**: Character count, loading states, error handling
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Responsive**: Works on mobile and desktop

### ✅ **Developer Experience**
- **TypeScript**: Full type safety
- **Customizable**: Configurable props for different use cases
- **Reusable**: Can be used in any chat interface
- **Error Handling**: Built-in error management

## Props

```typescript
interface MessageInputProps {
  onSendMessage: (message: string) => void;  // Required: Callback when message is sent
  disabled?: boolean;                        // Optional: Disable the input
  placeholder?: string;                      // Optional: Placeholder text
  maxLength?: number;                       // Optional: Maximum character limit
  className?: string;                       // Optional: Additional CSS classes
}
```

## Usage Examples

### Basic Usage
```tsx
import { MessageInput } from '@/components/chat/MessageInput';

function ChatComponent() {
  const handleSendMessage = (message: string) => {
    console.log('Sending:', message);
    // Send message logic here
  };

  return (
    <MessageInput
      onSendMessage={handleSendMessage}
      placeholder="Type your message..."
    />
  );
}
```

### With Custom Configuration
```tsx
<MessageInput
  onSendMessage={handleSendMessage}
  disabled={isLoading}
  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
  maxLength={1000}
  className="custom-input-styles"
/>
```

### With Loading State
```tsx
const [isSending, setIsSending] = useState(false);

const handleSendMessage = async (message: string) => {
  setIsSending(true);
  try {
    await sendMessage(message);
  } catch (error) {
    // Handle error
  } finally {
    setIsSending(false);
  }
};

<MessageInput
  onSendMessage={handleSendMessage}
  disabled={isSending}
/>
```

## Keyboard Shortcuts

### **Enter Key**
- **Enter**: Send message (if not empty)
- **Shift+Enter**: Add new line (multiline support)

### **Visual Indicators**
- **Character Count**: Shows current/max characters
- **Limit Warning**: Red text when approaching limit
- **Loading State**: Spinner and "Sending..." text
- **Disabled State**: Grayed out when disabled

## Styling

### **Default Styles**
- **Min Height**: 44px (touch-friendly)
- **Max Height**: 120px (about 5 lines)
- **Border**: Subtle border with focus ring
- **Send Button**: Circular button with hover effects

### **Custom Styling**
```tsx
<MessageInput
  className="custom-message-input"
  // Custom styles can be applied via className
/>
```

## Accessibility

### **ARIA Support**
- **aria-label**: Send button has proper label
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper announcements for state changes

### **Focus Management**
- **Auto-focus**: Focuses on mount (when not disabled)
- **Tab Navigation**: Proper tab order
- **Focus Indicators**: Clear focus states

## Error Handling

### **Built-in Validation**
- **Empty Messages**: Prevents sending empty messages
- **Character Limit**: Enforces max length
- **Disabled State**: Prevents interaction when disabled

### **Error Recovery**
- **Async Handling**: Proper async/await support
- **Error Callbacks**: Errors are passed to parent component
- **State Reset**: Input clears after successful send

## Performance

### **Optimizations**
- **Auto-resize**: Efficient height calculation
- **Debounced Updates**: Smooth typing experience
- **Memory Management**: Proper cleanup on unmount

### **Rendering**
- **Minimal Re-renders**: Only updates when necessary
- **Efficient Updates**: Uses refs for DOM manipulation
- **Smooth Animations**: CSS transitions for state changes

## Integration Examples

### **With Real-time Chat**
```tsx
import { useMessages } from '@/hooks/useMessages';

function ChatInterface({ channelId }: { channelId: string }) {
  const { sendMessage, isSending } = useMessages(channelId);

  return (
    <MessageInput
      onSendMessage={sendMessage}
      disabled={isSending}
      placeholder="Type your message..."
    />
  );
}
```

### **With Form Validation**
```tsx
const [errors, setErrors] = useState<string[]>([]);

const handleSendMessage = (message: string) => {
  // Validate message
  if (message.length < 1) {
    setErrors(['Message cannot be empty']);
    return;
  }
  
  // Send message
  sendMessage(message);
  setErrors([]);
};

<MessageInput
  onSendMessage={handleSendMessage}
  maxLength={500}
/>
```

## Best Practices

### **Do's**
- ✅ Use proper error handling
- ✅ Provide meaningful placeholder text
- ✅ Set appropriate character limits
- ✅ Handle loading states properly
- ✅ Use TypeScript for type safety

### **Don'ts**
- ❌ Don't forget to handle async errors
- ❌ Don't set maxLength too low
- ❌ Don't disable without clear reason
- ❌ Don't forget accessibility features

## Browser Support

### **Modern Browsers**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### **Mobile Support**
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Samsung Internet 13+

## Dependencies

### **Required**
- React 18+
- TypeScript 4.5+
- Tailwind CSS
- Lucide React (for icons)

### **Optional**
- Custom CSS classes
- Additional icon libraries
- Animation libraries

## Future Enhancements

### **Planned Features**
- 🔄 File attachment support
- 🔄 Emoji picker integration
- 🔄 Mention autocomplete
- 🔄 Voice message support
- 🔄 Message templates

### **Advanced Features**
- 🔄 Rich text editing
- 🔄 Message formatting
- 🔄 Code syntax highlighting
- 🔄 Message scheduling
- 🔄 Draft auto-save

## Troubleshooting

### **Common Issues**

#### **Textarea not auto-resizing**
- Check if `ref` is properly attached
- Ensure CSS height is not overridden
- Verify textarea has proper styling

#### **Send button not working**
- Check if `onSendMessage` is provided
- Verify message is not empty
- Ensure component is not disabled

#### **Keyboard shortcuts not working**
- Check if textarea has focus
- Verify event handlers are attached
- Ensure no other components are capturing events

### **Debug Tips**
- Use React DevTools to inspect props
- Check console for error messages
- Verify event handlers are called
- Test with different input lengths

## Conclusion

The MessageInput component provides a complete, production-ready solution for chat message input with:

- ✅ **Full Feature Set**: Multiline, send, disabled states
- ✅ **Great UX**: Auto-resize, keyboard shortcuts, visual feedback
- ✅ **Accessibility**: ARIA support, keyboard navigation
- ✅ **Developer Friendly**: TypeScript, customizable, reusable
- ✅ **Performance**: Optimized rendering, smooth animations

**Perfect for any chat application requiring a robust, user-friendly message input interface!**
