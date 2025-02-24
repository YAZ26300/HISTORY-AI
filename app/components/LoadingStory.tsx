import { Card, Flex, Text } from '@radix-ui/themes';
import { Wand2 } from 'lucide-react';

export default function LoadingStory() {
  return (
    <Card className="mt-8">
      <Flex direction="column" align="center" gap="4">
        <div className="relative">
          <Wand2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
        
        <div className="text-center">
          <Text size="5" weight="bold" color="blue">
            Création de votre histoire magique...
          </Text>
          <Text size="2" color="gray">
            Notre conteur travaille sur une histoire unique pour vous
          </Text>
        </div>

        <Flex gap="2" mt="2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </Flex>
      </Flex>
    </Card>
  );
} 