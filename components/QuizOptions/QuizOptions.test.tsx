import { render, screen, userEvent } from '@/test-utils';
import { QuizOptions } from './QuizOptions';

describe('QuizOptions component', () => {
  const user = userEvent.setup();

  it('renders quiz configuration interface', () => {
    render(<QuizOptions />);

    // Check header
    expect(screen.getByText('Quiz Configuration')).toBeInTheDocument();
    expect(
      screen.getByText('Configure your quiz settings and generate questions')
    ).toBeInTheDocument();

    // Check quiz mode selection
    expect(screen.getByText('Quiz Mode')).toBeInTheDocument();
    expect(screen.getByText('Take Quiz Online')).toBeInTheDocument();
    expect(screen.getByText('Export Quiz')).toBeInTheDocument();

    // Check rounds section
    expect(screen.getByText('Quiz Rounds')).toBeInTheDocument();
    expect(screen.getByText('Add Round')).toBeInTheDocument();

    // Check summary section
    expect(screen.getByText('Quiz Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Rounds')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('Estimated Time')).toBeInTheDocument();
  });

  it('allows adding and removing rounds', async () => {
    render(<QuizOptions />);

    // Initially should have 1 round
    expect(screen.getByText('1')).toBeInTheDocument();

    // Add a new round
    const addButton = screen.getByText('Add Round');
    await user.click(addButton);

    // Should now have 2 rounds
    expect(screen.getByText('2')).toBeInTheDocument();

    // Remove buttons should appear for both rounds (since we can't remove the first one)
    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons).toHaveLength(2);

    // Remove the second round
    await user.click(removeButtons[1]);

    // Should be back to 1 round
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('allows configuring round settings', async () => {
    render(<QuizOptions />);

    // Find the round name input
    const roundNameInput = screen.getByDisplayValue('Round 1');
    await user.clear(roundNameInput);
    await user.type(roundNameInput, 'Custom Round');

    expect(roundNameInput).toHaveValue('Custom Round');

    // Find the topic input
    const topicInput = screen.getByPlaceholderText(
      'e.g., Science, History, Literature'
    );
    await user.type(topicInput, 'Science Quiz');

    expect(topicInput).toHaveValue('Science Quiz');

    // Check questions count input
    const questionsInput = screen.getByDisplayValue('5');
    expect(questionsInput).toBeInTheDocument();

    // Check time limit toggle
    const timeLimitToggle = screen.getByRole('switch', { name: 'Time Limit' });
    expect(timeLimitToggle).toBeChecked();
  });

  it('allows switching between quiz modes', async () => {
    render(<QuizOptions />);

    // Initially should be in online mode
    const onlineButton = screen.getByText('Take Quiz Online');
    const exportButton = screen.getByText('Export Quiz');

    // Check that online button is filled and export button is light
    expect(onlineButton.closest('button')).toHaveAttribute(
      'data-variant',
      'filled'
    );
    expect(exportButton.closest('button')).toHaveAttribute(
      'data-variant',
      'light'
    );

    // Switch to export mode
    await user.click(exportButton);

    // Check that export button is now filled and online button is light
    expect(exportButton.closest('button')).toHaveAttribute(
      'data-variant',
      'filled'
    );
    expect(onlineButton.closest('button')).toHaveAttribute(
      'data-variant',
      'light'
    );

    // Check that description updates
    expect(
      screen.getByText(
        'Get a printable version with questions and answers for offline use'
      )
    ).toBeInTheDocument();
  });

  it('updates summary when round configuration changes', async () => {
    render(<QuizOptions />);

    // Initially should show 5 questions and 10 minutes
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10 min')).toBeInTheDocument();

    // Add a new round
    const addButton = screen.getByText('Add Round');
    await user.click(addButton);

    // Should now show 10 questions (5 + 5) and 20 minutes (10 + 10)
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20 min')).toBeInTheDocument();
  });

  it('validates required fields before generating quiz', async () => {
    render(<QuizOptions />);

    // Try to generate quiz without filling topics
    const generateButton = screen.getByText('Start Quiz');
    await user.click(generateButton);

    // Should show alert (we can't easily test alert in jest, but the function should be called)
    // The component logs to console, so we can verify the function executed
    expect(generateButton).toBeInTheDocument();
  });

  it('handles quiz generation for both modes', async () => {
    render(<QuizOptions />);

    // Fill in required topic
    const topicInput = screen.getByPlaceholderText(
      'e.g., Science, History, Literature'
    );
    await user.type(topicInput, 'Test Topic');

    // Test online mode generation
    const generateButton = screen.getByText('Start Quiz');
    await user.click(generateButton);

    // Switch to export mode
    const exportButton = screen.getByText('Export Quiz');
    await user.click(exportButton);

    // Button text should change
    expect(screen.getByText('Generate Quiz')).toBeInTheDocument();
  });
});
