import { useEvaluateStudySession } from '@/features/goal/hooks';
import type {
  EvaluateSessionData,
  StudySessionShort,
} from '@/features/goal/models';
import {
  Button,
  Center,
  Group,
  Input,
  Modal,
  MultiSelect,
  Rating,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconChevronDown,
  IconMoodEmpty,
  IconMoodSick,
  IconMoodSmile,
  IconMoodWink,
  IconMoodWrrr,
} from '@tabler/icons-react';

interface EvaluateSessionFormValues {
  planning: number;
  domain_perception: number;
  difficulty: number;
  strategies: string[];
  comments: string;
}

interface EvaluateSessionModalProps {
  goalId: string;
  session: StudySessionShort | null;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function EvaluateSessionModal({
  goalId,
  session,
  isOpen,
  setIsOpen,
}: EvaluateSessionModalProps) {
  const estrategiasOpcoes = [
    { value: 'VIDEO', label: 'Vídeos' },
    { value: 'READING', label: 'Leitura' },
    { value: 'PRACTICE', label: 'Prática' },
    { value: 'FLASHCARDS', label: 'Flashcards' },
    { value: 'MIND_MAP', label: 'Mapa Mental' },
    { value: 'FEYNMAN', label: 'Técnica de Feynman' },
    { value: 'SELF_EXPLANATION', label: 'Autoexplicação' },
  ];

  const getIconStyle = (color?: string, shade: number = 7) => ({
    width: 32,
    height: 32,
    color: color ? `var(--mantine-color-${color}-${shade})` : undefined,
  });

  const getEmptyIcon = (value: number) => {
    const iconStyle = getIconStyle();

    switch (value) {
      case 1:
        return <IconMoodWrrr style={iconStyle} />;
      case 2:
        return <IconMoodSick style={iconStyle} />;
      case 3:
        return <IconMoodEmpty style={iconStyle} />;
      case 4:
        return <IconMoodSmile style={iconStyle} />;
      case 5:
        return <IconMoodWink style={iconStyle} />;
      default:
        return null;
    }
  };

  const getDomainFullIcon = (value: number) => {
    let icon;

    switch (value) {
      case 1:
        icon = <IconMoodWrrr style={getIconStyle('red')} />;
        break;
      case 2:
        icon = <IconMoodSick style={getIconStyle('orange')} />;
        break;
      case 3:
        icon = <IconMoodEmpty style={getIconStyle('yellow')} />;
        break;
      case 4:
        icon = <IconMoodWink style={getIconStyle('lime')} />;
        break;
      case 5:
        icon = <IconMoodWink style={getIconStyle('green')} />;
        break;
      default:
        return null;
    }

    return (
      <Tooltip
        label={getDomainTooltipText(value)}
        withArrow
        position="bottom"
        c="white"
        bg="dark.8"
      >
        <div>{icon}</div>
      </Tooltip>
    );
  };

  const getDifficultyFullIcon = (value: number) => {
    let icon;

    switch (value) {
      case 1:
        icon = <IconMoodWink style={getIconStyle('red', 5)} />;
        break;
      case 2:
        icon = <IconMoodSmile style={getIconStyle('red', 6)} />;
        break;
      case 3:
        icon = <IconMoodEmpty style={getIconStyle('red', 7)} />;
        break;
      case 4:
        icon = <IconMoodSick style={getIconStyle('red', 8)} />;
        break;
      case 5:
        icon = <IconMoodWrrr style={getIconStyle('red', 9)} />;
        break;
      default:
        return null;
    }

    return (
      <Tooltip
        label={getDifficultyTooltipText(value)}
        withArrow
        position="bottom"
        c="white"
        bg="dark.8"
      >
        <div>{icon}</div>
      </Tooltip>
    );
  };

  const getDomainTooltipText = (value: number) => {
    switch (value) {
      case 1:
        return 'Não entendi nada';
      case 2:
        return 'Entendi pouco';
      case 3:
        return 'Entendi o básico';
      case 4:
        return 'Entendi bem';
      case 5:
        return 'Dominei o assunto';
      default:
        return '';
    }
  };

  const getDifficultyTooltipText = (value: number) => {
    switch (value) {
      case 1:
        return 'Muito fácil';
      case 2:
        return 'Fácil';
      case 3:
        return 'Moderado';
      case 4:
        return 'Desafiador';
      case 5:
        return 'Mentalmente exaustivo';
      default:
        return '';
    }
  };

  const form = useForm<EvaluateSessionFormValues>({
    initialValues: {
      planning: 0,
      domain_perception: 0,
      difficulty: 0,
      strategies: [],
      comments: '',
    },
    validate: {
      planning: (value) =>
        value === 0 ? 'A avaliação do planejamento é obrigatória' : null,
      domain_perception: (value) =>
        value === 0 ? 'A percepção de domínio é obrigatória' : null,
      difficulty: (value) =>
        value === 0 ? 'A avaliação de dificuldade é obrigatória' : null,
      strategies: (value) =>
        value.length === 0 ? 'Selecione pelo menos uma estratégia' : null,
    },
  });

  const evaluateMutation = useEvaluateStudySession(goalId);

  function handleSubmit(values: EvaluateSessionFormValues) {
    if (session === null) {
      return;
    }

    const data: EvaluateSessionData = {
      sessionId: session.id,
      rating: values.planning,
      domain_perception_level: values.domain_perception,
      learning_difficulty_level: values.difficulty,
      strategies: values.strategies,
      final_comment: values.comments,
    };

    evaluateMutation.mutate(data);

    form.reset();
    setIsOpen(false);
  }

  function handleClose() {
    form.reset();
    setIsOpen(false);
  }

  if (session === null) {
    return <p>Algo deu errado.</p>;
  }

  return (
    <Modal.Root opened={isOpen} onClose={handleClose} size="500px">
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Group wrap="nowrap" w="100%">
            <Center
              w={56}
              h={56}
              style={{
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              <img
                src="/assets/james-avatar.svg"
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Center>

            <Stack gap={0} flex={1}>
              <Modal.Title fw={700} fz="lg">
                Como foi a Sessão de Estudos?
              </Modal.Title>
              <Text c="dimmed" size="sm">
                Reflita sobre {session.title}
              </Text>
            </Stack>
            <Modal.CloseButton />
          </Group>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Input.Wrapper
              label="Planejamento da Sessão"
              description="O quão bom foi o planejamento dessa sessão?"
              required
              error={form.errors.planning}
              labelProps={{ fz: 'md' }}
              descriptionProps={{ size: 'sm' }}
            >
              <Center mt="sm">
                <Rating
                  fractions={4}
                  size="xl"
                  style={{ gap: '8px' }}
                  {...form.getInputProps('planning')}
                />
              </Center>
            </Input.Wrapper>

            <Input.Wrapper
              label="Percepção de Domínio"
              description="O quanto você sente que domina o conteúdo estudado agora?"
              required
              error={form.errors.domain_perception}
              labelProps={{ fz: 'md' }}
              descriptionProps={{ size: 'sm' }}
              mt="md"
            >
              <Center mt="sm">
                <Rating
                  size="xl"
                  emptySymbol={getEmptyIcon}
                  fullSymbol={getDomainFullIcon}
                  style={{ gap: '8px' }}
                  {...form.getInputProps('domain_perception')}
                />
              </Center>
            </Input.Wrapper>

            <Input.Wrapper
              label="Dificuldade no Aprendizado"
              description="O quão difícil foi processar as informações?"
              required
              error={form.errors.difficulty}
              labelProps={{ fz: 'md' }}
              descriptionProps={{ size: 'sm' }}
              mt="md"
            >
              <Center mt="sm">
                <Rating
                  size="xl"
                  emptySymbol={(value) => getEmptyIcon(6 - value)}
                  fullSymbol={getDifficultyFullIcon}
                  style={{ gap: '8px' }}
                  {...form.getInputProps('difficulty')}
                />
              </Center>
            </Input.Wrapper>

            <MultiSelect
              label="Estratégia(s) usada(s)"
              description="Selecione as estratégias usadas nessa sessão de estudos."
              data={estrategiasOpcoes}
              placeholder={
                form.values.strategies.length > 0 ? '' : 'Selecione...'
              }
              searchable
              required
              labelProps={{ fw: 600, fz: 'md' }}
              descriptionProps={{ size: 'sm' }}
              mt="md"
              rightSection={<IconChevronDown size={16} color="gray" />}
              {...form.getInputProps('strategies')}
            />

            <Textarea
              label="Comentário"
              description="Escreva uma opinião sobre essa sessão de estudos."
              placeholder="Começar mais cedo, poucas atividades, ..."
              minRows={3}
              autosize
              labelProps={{ fw: 600, fz: 'md' }}
              descriptionProps={{ size: 'sm' }}
              mt="md"
              {...form.getInputProps('comments')}
            />

            <Group justify="flex-end" mt="xl">
              <Button
                type="submit"
                color="orange.6"
                size="md"
                radius="md"
                disabled={!form.isValid()}
              >
                Enviar
              </Button>
            </Group>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
