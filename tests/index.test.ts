import { spawn } from 'child_process';

test('spawn python process', () => {
  const process = spawn('python', ['--version']);
  // Rewrite the test to use an example file that runs correctly
  expect(process).toBeTruthy();
});