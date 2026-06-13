import { useState } from 'react';
import { ActionIcon, Affix, Flex, Transition } from '@mantine/core';
import ChatWindow from './ChatWindow';

export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Affix position={{ bottom: 20, right: 20 }} zIndex={100}>
      <Flex direction="column" align="flex-end" gap="sm">
        <Transition transition="slide-up" mounted={isOpen}>
          {(transitionStyles) => (
            <ChatWindow
              style={transitionStyles}
              onClose={() => setIsOpen(false)}
            />
          )}
        </Transition>

        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="orange"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open chat"
          w={60}
          h={60}
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <img src="/favicon.svg" width={32} height={32} alt="" />
        </ActionIcon>
      </Flex>
    </Affix>
  );
}
