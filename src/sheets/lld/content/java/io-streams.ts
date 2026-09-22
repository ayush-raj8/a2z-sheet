import { lesson } from '../lessonFactory';

export default lesson({
  id: 'java-io-streams',
  title: 'Java I/O Streams and Scanner',
  section: 'java',
  chapter: 'Java I/O',
  difficulty: 'intermediate',
  importance: 2,
  prerequisites: ['java-exceptions'],
  summary:
    'Java I/O is stream-based: byte streams vs character streams, file readers/writers, try-with-resources, and Scanner for tokenized input.',
  keywords: ['InputStream', 'Reader', 'FileReader', 'Scanner', 'try-with-resources', 'I/O'],
  why:
    'College OOP courses spend a module on I/O. Interviews care less about every subclass, but you should read/write files safely and know byte vs character streams.',
  theory: [
    'I/O is modeled as streams connected to a source or sink (file, console, network).',
    'Byte streams (InputStream/OutputStream) handle raw bytes — good for binary data.',
    'Character streams (Reader/Writer) handle text with charset decoding/encoding.',
    'Common file types: FileInputStream/FileOutputStream, FileReader/FileWriter (and newer java.nio.file APIs).',
    'Always close streams — prefer try-with-resources so close happens even on exceptions.',
    'Scanner tokenizes input from System.in, files, or strings (nextInt, nextLine, hasNext…).',
    'System.in / System.out / System.err are predefined streams for console I/O.',
  ],
  mentalModel:
    'A stream is a hose. Byte hoses move opaque bytes; character hoses move decoded text. try-with-resources is an automatic shutoff valve when you leave the block.',
  codeTitle: 'Read text with try-with-resources + Scanner',
  code: `import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Scanner;

public class IoDemo {
    static void readFile(String path) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } // br closed automatically
    }

    public static void main(String[] args) {
        try (Scanner sc = new Scanner("10 20 hello")) {
            System.out.println(sc.nextInt());
            System.out.println(sc.nextInt());
            System.out.println(sc.next());
        }
    }
}`,
  output: `10
20
hello`,
  explain: [
    'BufferedReader wraps a FileReader for efficient line-oriented character input.',
    'try-with-resources ensures close() even if readLine throws.',
    'Scanner parses tokens from a string here; same API works with System.in or a File.',
  ],
  mistakes: [
    'Forgetting to close streams (resource leaks).',
    'Using byte streams for text without thinking about charset.',
    'Mixing nextInt() and nextLine() on Scanner without consuming the newline carefully.',
  ],
  interviewAsk: 'Byte stream vs character stream — when do you use each?',
  interviewAnswer:
    'Byte streams for binary data; character streams for text so encoding is handled. Prefer try-with-resources. For modern file path work, also know java.nio.file.Files.',
  interviewTraps: [
    'Memorizing every *Stream subclass name without understanding the byte/char split.',
  ],
  quiz: {
    question: 'Why prefer try-with-resources for file streams?',
    options: [
      'It makes I/O faster',
      'It auto-closes resources even when exceptions occur',
      'It disables checked exceptions',
      'It only works with Scanner',
    ],
    correctIndex: 1,
    explain: 'AutoCloseable resources are closed on exit from the try block, avoiding leaks on error paths.',
  },
  practice:
    'Write a program that copies a text file line-by-line using BufferedReader/BufferedWriter and try-with-resources.',
  practiceHints: ['Files.newBufferedReader(Path) is a nice modern alternative if you want.'],
});
