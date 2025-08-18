import { render, screen, userEvent } from '@/test-utils';
import { QuizOptions } from './QuizOptions';

describe('QuizOptions component', () => {
  const user = userEvent.setup();

  it('renders quiz configuration interface', () => {
    render(<QuizOptions />);

    // Check header
    expect(screen.getByText('Quiz Maker')).toBeInTheDocument();
    expect(
      screen.getByText('Configure your quiz settings and generate questions')
    ).toBeInTheDocument();

    // Check quiz topic section
    expect(
      screen.getByRole('heading', { name: 'Quiz Topic' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Quiz Topic')).toBeInTheDocument();

    // Check rounds section
    expect(screen.getByText('Quiz Rounds')).toBeInTheDocument();
    expect(screen.getByText('Add Round')).toBeInTheDocument();

    // Check quiz mode section
    expect(
      screen.getByRole('heading', { name: 'Quiz Mode' })
    ).toBeInTheDocument();
    expect(screen.getByText('Take Quiz Online')).toBeInTheDocument();
    expect(screen.getByText('Export Quiz')).toBeInTheDocument();

    // Check summary section
    expect(
      screen.getByRole('heading', { name: 'Quiz Summary' })
    ).toBeInTheDocument();
    expect(screen.getByText('Total Rounds')).toBeInTheDocument();
    expect(screen.getByText('Total Questions')).toBeInTheDocument();
    expect(screen.getByText('Estimated Time')).toBeInTheDocument();

    // Check action button
    expect(screen.getByText('Start Quiz')).toBeInTheDocument();
  });

  it('allows configuring round settings', async () => {
    render(<QuizOptions />);

    // Find the round name input
    const roundNameInput = screen.getByDisplayValue('Round 1');
    await user.clear(roundNameInput);
    await user.type(roundNameInput, 'Custom Round');

    expect(roundNameInput).toHaveValue('Custom Round');

    // Find the topic input using the label
    const topicInput = screen.getByLabelText('Topic');
    await user.type(topicInput, 'Science Quiz');

    expect(topicInput).toHaveValue('Science Quiz');

    // Check questions count input (now defaults to 10)
    const questionsInput = screen.getByDisplayValue('10');
    expect(questionsInput).toBeInTheDocument();

    // Check time limit toggle
    const timeLimitToggle = screen.getByLabelText('Time Limit');
    expect(timeLimitToggle).toBeChecked();

    // Check time limit input (should be visible and default to 15)
    const timeLimitInput = screen.getByDisplayValue('15');
    expect(timeLimitInput).toBeInTheDocument();
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

    // Remove button should appear for the second round (icon only)
    // Find buttons with trash icon by looking for the IconTrash component
    const removeButtons = screen
      .getAllByRole('button')
      .filter(
        (button) =>
          button.querySelector('svg[data-icon="trash"]') ||
          button.querySelector('svg[class*="tabler-icon-trash"]')
      );
    expect(removeButtons.length).toBeGreaterThan(0);

    // Remove the second round
    await user.click(removeButtons[0]);

    // Should be back to 1 round
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('allows switching between quiz modes', async () => {
    render(<QuizOptions />);

    // Initially should be in online mode
    const exportButton = screen.getByText('Export Quiz');

    // Check that online mode description is shown
    expect(
      screen.getByText(
        'Take the quiz directly in this app with automatic scoring'
      )
    ).toBeInTheDocument();

    // Switch to export mode
    await user.click(exportButton);

    // Check that export mode description is shown
    expect(
      screen.getByText(
        'Get a printable version with questions and answers for offline use'
      )
    ).toBeInTheDocument();

    // Check that button text changes
    expect(screen.getByText('Generate Quiz')).toBeInTheDocument();
  });

  it('updates summary when configuration changes', async () => {
    render(<QuizOptions />);

    // Initially should show 1 round, 10 questions, 15 minutes
    expect(screen.getByText('1')).toBeInTheDocument(); // Total Rounds
    expect(screen.getByText('10')).toBeInTheDocument(); // Total Questions
    expect(screen.getByText('15 min')).toBeInTheDocument(); // Estimated Time

    // Add a round
    const addButton = screen.getByText('Add Round');
    await user.click(addButton);

    // Should now show 2 rounds, 20 questions, 30 minutes
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Rounds
    expect(screen.getByText('20')).toBeInTheDocument(); // Total Questions
    expect(screen.getByText('30 min')).toBeInTheDocument(); // Estimated Time
  });

  it('allows configuring quiz topic', async () => {
    render(<QuizOptions />);

    const topicInput = screen.getByLabelText('Quiz Topic');
    await user.type(topicInput, 'General Knowledge Quiz');

    expect(topicInput).toHaveValue('General Knowledge Quiz');
  });

  it('handles time limit toggle correctly', async () => {
    render(<QuizOptions />);

    // Initially time limit should be enabled
    const timeLimitToggle = screen.getByLabelText('Time Limit');
    expect(timeLimitToggle).toBeChecked();

    // Time limit input should be visible
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();

    // Toggle off time limit
    await user.click(timeLimitToggle);
    expect(timeLimitToggle).not.toBeChecked();

    // Time limit input should not be visible
    expect(screen.queryByDisplayValue('15')).not.toBeInTheDocument();
  });
});
